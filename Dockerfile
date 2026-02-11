FROM python:3.14-slim
WORKDIR /app
COPY GCP/requirements.txt .
RUN pip install -r requirements.txt
COPY GCP/*.py .
EXPOSE 8000
CMD ["uvicorn", "app:app", "--reload", "--host", "0.0.0.0", "--port", "8000" ]