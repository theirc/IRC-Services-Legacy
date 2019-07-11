#!/bin/bash
cd frontend
npm run build
cd ..
gulp | ./manage.py collectstatic --noinput