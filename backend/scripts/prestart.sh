#! /usr/bin/env bash

set -e
set -x

# Let the DB start
python app/backend_pre_start.py

alembic stamp head
alembic revision --autogenerate -m "New revision"
alembic upgrade head
alembic stamp head
# Run migrations

# Create initial data in DB
python app/initial_data.py
