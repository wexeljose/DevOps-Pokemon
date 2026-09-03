FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

WORKDIR /app

RUN groupadd --system app \
    && useradd --system --gid app --create-home app

COPY requirements.txt ./
RUN pip install --no-cache-dir --disable-pip-version-check -r requirements.txt

COPY --chown=app:app app.py ./
COPY --chown=app:app static ./static
COPY --chown=app:app templates ./templates

USER app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=90s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\", \"5000\")}/health', timeout=2)"

CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT} --timeout 180 --access-logfile - 'app:create_app()'"]

