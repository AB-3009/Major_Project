from pymongo import MongoClient

def get_db():
    mongo_client = MongoClient("mongodb+srv://ayush:ayush@minortry.1bb9ycf.mongodb.net/?retryWrites=true&w=majority&appName=minortry",
        connectTimeoutMS=30000,
        socketTimeoutMS=None,
        connect=False,
        maxPoolSize=1)
    db = mongo_client['plant_disease_db']
    return db
