from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from typing import Annotated
from fastapi import Depends
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import google.oauth2.credentials
import google_auth_oauthlib.flow
import requests
from urllib.parse import urlparse
from urllib.parse import parse_qs

config = Config("../.env")  # Load from .env file
oauth = OAuth(config)
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET', default='')
GOOGLE_CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
APP_GOOGLE_REDIRECT_URI = 'http://localhost:8000/api/v1/auth/google/callback'

flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file('google_client_secret.json',
    scopes=['https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'])

router = APIRouter(prefix="/auth", tags=["auth"])



@router.get("/google/login/")
async def google_login():
    #redirect_uri = "http://localhost:8000/api/v1/auth/google/callback"
    
    flow.redirect_uri = APP_GOOGLE_REDIRECT_URI

    authorization_url, state = flow.authorization_url(
        # Recommended, enable offline access so that you can refresh an access token without
        # re-prompting the user for permission. Recommended for web server apps.
        access_type='offline',
        # Optional, enable incremental authorization. Recommended as a best practice.
        include_granted_scopes='true',
        # Optional, if your application knows which user is trying to authenticate, it can use this
        # parameter to provide a hint to the Google Authentication Server.
        login_hint='hint@example.com',
        # Optional, set prompt to 'consent' will prompt the user for consent
        prompt='consent')
        
    return RedirectResponse(
        url=authorization_url
    )

@router.get("/google/callback/")
async def google_callback(request: Request):

    authorization_response = request.url
    auth_code = parse_qs(authorization_response.query)['code'][0]
    url = "https://oauth2.googleapis.com/token"

    payload = {'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': APP_GOOGLE_REDIRECT_URI,
        'grant_type': 'authorization_code'}

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    ret = response.json()
    access_token = ret["access_token"]
    print(access_token)

    get_profile_url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token={}".format(access_token)
    response = requests.request("GET", get_profile_url)
    ret = response.json()
    email = ret["email"]
    
    return RedirectResponse(
        url=f"http://localhost:5173/login?token=dummy_token"
    )

@router.get("/health-check/")
async def health_check() -> bool:
    return True