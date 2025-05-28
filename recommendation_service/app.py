from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy
from collections import defaultdict
import joblib
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}})

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['mern-rooms']
users_collection = db['users']
rooms_collection = db['rooms']
events_collection = db['events']

def load_data():
    try:
        data = []
        for user in users_collection.find():
            user_id = str(user['_id'])
            for apt_id in user.get('likedApartments', []):
                data.append({'user_id': user_id, 'item_id': str(apt_id), 'like': 1})
        df = pd.DataFrame(data)
        print(f"Loaded data: {len(df)} rows")
        if not df.empty:
            print("Первые 5 строк df:")
            print(df.head())
            print("Типы данных в df:")
            print(df.dtypes)
        return df
    except Exception as e:
        print(f"Ошибка в load_data: {str(e)}")
        return pd.DataFrame()

def get_all_items():
    try:
        all_room_ids = [str(room['_id']) for room in rooms_collection.find({}, {'_id': 1})]
        print(f"All room IDs: {len(all_room_ids)}")
        return all_room_ids
    except Exception as e:
        print(f"Ошибка в get_all_items: {str(e)}")
        return []

def precision_recall_at_k(predictions, k=3, threshold=0.5):
    user_est_true = defaultdict(list)
    for pred in predictions:
        user_est_true[pred.uid].append((pred.est, pred.r_ui))
    precisions = []
    recalls = []
    for uid, user_ratings in user_est_true.items():
        user_ratings.sort(key=lambda x: x[0], reverse=True)
        n_rel = sum((true_r >= threshold) for (_, true_r) in user_ratings)
        n_rec_k = sum((est >= threshold) for (est, _) in user_ratings[:k])
        n_rel_and_rec_k = sum((true_r >= threshold) for (est, true_r) in user_ratings[:k] if est >= threshold)
        precisions.append(n_rel_and_rec_k / n_rec_k if n_rec_k != 0 else 0)
        recalls.append(n_rel_and_rec_k / n_rel if n_rel != 0 else 0)
    return sum(precisions) / len(precisions) if precisions else 0, sum(recalls) / len(recalls) if recalls else 0

def train_model(df):
    try:
        model_path = 'svd_model.pkl'
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            print("Модель загружена из svd_model.pkl")
        else:
            if df.empty:
                print("DataFrame пустой, невозможно обучить модель")
                return None
            print(f"Обучаем SVD на данных: {df.shape}, уникальных пользователей: {df['user_id'].nunique()}, комнат: {df['item_id'].nunique()}")
            reader = Reader(rating_scale=(0, 1))
            dataset = Dataset.load_from_df(df[['user_id', 'item_id', 'like']], reader)
            # Делим данные: 80% — обучение, 20% — тест
            trainset, testset = train_test_split(dataset, test_size=0.2, random_state=42)
            model = SVD()
            model.fit(trainset)
            # Оцениваем на тестовой выборке
            predictions = model.test(testset)
            rmse = accuracy.rmse(predictions)
            mae = accuracy.mae(predictions)
            precision, recall = precision_recall_at_k(predictions, k=3, threshold=0.5)
            print(f"Метрики модели: RMSE: {rmse:.4f}, MAE: {mae:.4f}, Precision@3: {precision:.4f}, Recall@3: {recall:.4f}")
            # Обучаем модель на всех данных
            trainset = dataset.build_full_trainset()
            model.fit(trainset)
            joblib.dump(model, model_path)
            print("Модель обучена и сохранена в svd_model.pkl")
        return model
    except Exception as e:
        print(f"Ошибка в train_model: {str(e)}")
        return None

@app.route('/track/view', methods=['POST'])
def track_view():
    try:
        data = request.json
        user_id = data.get('userId', 'anonymous')
        session_id = data.get('sessionId', str(uuid.uuid4()))
        room_id = data.get('roomId')
        view_duration = data.get('viewDuration', 0)

        if not room_id or not session_id:
            print(f"Неполные данные для трекинга просмотра: {data}")
            return jsonify({'error': 'roomId и sessionId обязательны'}), 400

        try:
            ObjectId(room_id)
        except Exception:
            print(f"Невалидный roomId: {room_id}")
            return jsonify({'error': 'roomId должен быть валидным ObjectId'}), 400

        event = {
            'userId': user_id,
            'sessionId': session_id,
            'eventType': 'view',
            'eventData': {
                'roomId': room_id,
                'viewDuration': view_duration
            },
            'timestamp': datetime.now()
        }
        events_collection.insert_one(event)
        print(f"Событие view сохранено: {event}")
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Ошибка в track_view: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/track/filter', methods=['POST'])
def track_filter():
    try:
        data = request.json
        user_id = data.get('userId', 'anonymous')
        session_id = data.get('sessionId', str(uuid.uuid4()))
        filters = data.get('filters', {})

        if not session_id or not filters:
            print(f"Неполные данные для трекинга фильтров: {data}")
            return jsonify({'error': 'sessionId и filters обязательны'}), 400

        event = {
            'userId': user_id,
            'sessionId': session_id,
            'eventType': 'filter',
            'eventData': filters,
            'timestamp': datetime.now()
        }
        events_collection.insert_one(event)
        print(f"Событие filter сохранено: {event}")
        return jsonify({'status': 'ok'})
    except Exception as e:
        print(f"Ошибка в track_filter: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_behavior_based_recommendations(user_id, limit=3):
    try:
        user_events = events_collection.find({'userId': user_id}).sort('timestamp', -1).limit(50)
        view_counts = {}
        preferred_filters = {'location': {}, 'underground': {}, 'priceRange': {}, 'dealType': {}}

        for event in user_events:
            if event['eventType'] == 'view':
                room_id = event['eventData']['roomId']
                view_counts[room_id] = view_counts.get(room_id, 0) + event['eventData'].get('viewDuration', 0)
            elif event['eventType'] == 'filter':
                filters = event['eventData']
                for key in preferred_filters:
                    if key in filters:
                        value = str(filters[key])
                        preferred_filters[key][value] = preferred_filters[key].get(value, 0) + 1

        top_locations = sorted(preferred_filters['location'].items(), key=lambda x: x[1], reverse=True)[:2]
        top_undergrounds = sorted(preferred_filters['underground'].items(), key=lambda x: x[1], reverse=True)[:3]
        top_deal_types = sorted(preferred_filters['dealType'].items(), key=lambda x: x[1], reverse=True)[:1]

        query = {}
        if top_locations:
            query['location'] = {'$in': [loc[0] for loc in top_locations if loc[0] != 'all']}
        if top_undergrounds:
            query['underground'] = {'$in': [und[0] for und in top_undergrounds if und[0] != 'all']}
        if top_deal_types:
            query['deal_type'] = {'$in': [dt[0] for dt in top_deal_types if dt[0] != 'all']}

        viewed_rooms = list(view_counts.keys())
        if viewed_rooms:
            try:
                query['_id'] = {'$nin': [ObjectId(rid) for rid in viewed_rooms]}
            except Exception as e:
                print(f"Ошибка при создании $nin для viewed_rooms: {str(e)}")

        rooms = rooms_collection.find(query).limit(limit)
        recommendations = []
        for room in rooms:
            recommendations.append({
                'item_id': str(room['_id']),
                'name': room.get('street', 'Неизвестно') + ' ' + str(room.get('house_number', '')),
                'score': 1.0,
                'imageurls': room.get('imageurls', []),
                'rentperday': room.get('price_per_month', 0) or (room.get('price', 0) / 30 if room.get('deal_type') == 'sale' else 0),
                'maxcount': room.get('rooms_count', 0) * 2 if room.get('rooms_count', 0) > 0 else 2,
                'location': room.get('location', 'Неизвестно'),
                'author': room.get('author', 'Неизвестно'),
                'author_type': room.get('author_type', 'Неизвестно'),
                'deal_type': room.get('deal_type', 'Неизвестно'),
                'accommodation_type': room.get('accommodation_type', 'Неизвестно'),
                'floor': room.get('floor', 'Неизвестно'),
                'floors_count': room.get('floors_count', 'Неизвестно'),
                'rooms_count': room.get('rooms_count', 'Неизвестно'),
                'total_meters': room.get('total_meters', 'Неизвестно'),
                'price': room.get('price', 'Неизвестно'),
                'underground': room.get('underground', 'Неизвестно'),
                'url': room.get('url', 'Неизвестно'),
                'coordinates': room.get('coordinates', {'lat': 55.7558, 'lon': 37.6173})
            })
        print(f"Behavior-based рекомендации для {user_id}: {len(recommendations)}")
        return recommendations
    except Exception as e:
        print(f"Ошибка в get_behavior_based_recommendations: {str(e)}")
        return []

df = load_data()
all_items = get_all_items()
model = train_model(df)

@app.route('/recommend/<user_id>', methods=['GET'])
def recommend(user_id):
    try:
        print(f"Запрос рекомендаций для user_id: {user_id}")
        if not users_collection.find_one({'_id': ObjectId(user_id)}):
            print(f"Пользователь {user_id} не найден в базе")
            recommendations = get_behavior_based_recommendations(user_id)
            print(f"Behavior-based рекомендации: {len(recommendations)}")
            return jsonify({'recommendations': recommendations})

        if df.empty or user_id not in df['user_id'].unique():
            print(f"Пользователь {user_id} не имеет лайков или df пустой, пробуем поведение")
            recommendations = get_behavior_based_recommendations(user_id)
            print(f"Behavior-based рекомендации: {len(recommendations)}")
            return jsonify({'recommendations': recommendations})

        user_likes = df[df['user_id'] == user_id]['item_id'].tolist()
        print(f"User likes: {user_likes}")
        items_to_predict = [item for item in all_items if item not in user_likes]
        print(f"Items to predict: {len(items_to_predict)}")

        if not items_to_predict:
            print(f"Нет объектов для рекомендации для {user_id}")
            recommendations = get_behavior_based_recommendations(user_id)
            print(f"Behavior-based рекомендации: {len(recommendations)}")
            return jsonify({'recommendations': recommendations})

        if not model:
            print("Модель SVD не инициализирована, пробуем поведение")
            recommendations = get_behavior_based_recommendations(user_id)
            print(f"Behavior-based рекомендации: {len(recommendations)}")
            return jsonify({'recommendations': recommendations})

        predictions = [model.predict(user_id, item_id) for item_id in items_to_predict]
        top_n = sorted(predictions, key=lambda x: x.est, reverse=True)[:3]
        print(f"Топ {len(top_n)} предсказаний: {[pred.iid for pred in top_n]}")

        recommendations = []
        for pred in top_n:
            item_id = pred.iid
            try:
                room = rooms_collection.find_one({'_id': ObjectId(item_id)})
                if room:
                    print(f"Найдена комната {item_id}")
                    recommendations.append({
                        'item_id': item_id,
                        'name': room.get('street', 'Неизвестно') + ' ' + str(room.get('house_number', '')),
                        'score': pred.est,
                        'imageurls': room.get('imageurls', []),
                        'rentperday': room.get('price_per_month', 0) or (room.get('price', 0) / 30 if room.get('deal_type') == 'sale' else 0),
                        'maxcount': room.get('rooms_count', 0) * 2 if room.get('rooms_count', 0) > 0 else 2,
                        'location': room.get('location', 'Неизвестно'),
                        'author': room.get('author', 'Неизвестно'),
                        'author_type': room.get('author_type', 'Неизвестно'),
                        'deal_type': room.get('deal_type', 'Неизвестно'),
                        'accommodation_type': room.get('accommodation_type', 'Неизвестно'),
                        'floor': room.get('floor', 'Неизвестно'),
                        'floors_count': room.get('floors_count', 'Неизвестно'),
                        'rooms_count': room.get('rooms_count', 'Неизвестно'),
                        'total_meters': room.get('total_meters', 'Неизвестно'),
                        'price': room.get('price', 'Неизвестно'),
                        'underground': room.get('underground', 'Неизвестно'),
                        'url': room.get('url', 'Неизвестно'),
                        'coordinates': room.get('coordinates', {'lat': 55.7558, 'lon': 37.6173})
                    })
                else:
                    print(f"Комната {item_id} не найдена")
                    recommendations.append({
                        'item_id': item_id,
                        'name': 'Неизвестно',
                        'score': pred.est,
                        'imageurls': [],
                        'rentperday': 0,
                        'maxcount': 2,
                        'location': 'Неизвестно',
                        'author': 'Неизвестно',
                        'author_type': 'Неизвестно',
                        'deal_type': 'Неизвестно',
                        'accommodation_type': 'Неизвестно',
                        'floor': 'Неизвестно',
                        'floors_count': 'Неизвестно',
                        'rooms_count': 'Неизвестно',
                        'total_meters': 'Неизвестно',
                        'price': 'Неизвестно',
                        'underground': 'Неизвестно',
                        'url': 'Неизвестно',
                        'coordinates': {'lat': 55.7558, 'lon': 37.6173}
                    })
            except Exception as e:
                print(f"Ошибка при получении комнаты {item_id}: {str(e)}")
                recommendations.append({
                    'item_id': item_id,
                    'name': 'Ошибка',
                    'score': pred.est,
                    'imageurls': [],
                    'rentperday': 0,
                    'maxcount': 2,
                    'location': 'Неизвестно',
                    'author': 'Неизвестно',
                    'author_type': 'Неизвестно',
                    'deal_type': 'Неизвестно',
                    'accommodation_type': 'Неизвестно',
                    'floor': 'Неизвестно',
                    'floors_count': 'Неизвестно',
                    'rooms_count': 'Неизвестно',
                    'total_meters': 'Неизвестно',
                    'price': 'Неизвестно',
                    'underground': 'Неизвестно',
                    'url': 'Неизвестно',
                    'coordinates': {'lat': 55.7558, 'lon': 37.6173}
                })

        print(f"SVD рекомендации для {user_id}: {len(recommendations)}")
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        print(f"Критическая ошибка в /recommend/{user_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(Exception)
def handle_error(error):
    print(f"Глобальная ошибка: {str(error)}")
    return jsonify({'error': str(error)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)