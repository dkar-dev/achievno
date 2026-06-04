FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:${PATH}"

WORKDIR /app

COPY app/server/pyproject.toml app/server/uv.lock ./
RUN python -m pip install --no-cache-dir uv==0.11.15 \
    && uv sync --frozen --no-dev

COPY app/server/manage.py ./
COPY app/server/config ./config
COPY app/server/apps ./apps

ENV DJANGO_DEBUG=false

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
