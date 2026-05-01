from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import customers, employees, menu, orders, rewards, analytics

app = FastAPI(
    title="Fast Food Reward Program API",
    version="1.0.0",
    description="Backend for the Fastfood Rewards loyalty system",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(menu.router, prefix="/menu", tags=["Menu"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(rewards.router, prefix="/rewards", tags=["Rewards"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Fastfood Rewards API is running"}
