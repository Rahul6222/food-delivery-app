from fastapi import FastAPI

#declare app
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to Food Delivery API"}

@app.get("/menu")
def get_menu():
    return [
        {"id": 1, "name": "Burger", "price": 5},
        {"id": 2, "name": "Pizza", "price": 8}
    ]

@app.post("/order")
def place_order(order: dict):
    return {"status": "Order Placed", "order": order}
