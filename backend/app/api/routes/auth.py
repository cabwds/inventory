from datetime import timedelta
from app.core.config import settings
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from typing import Annotated
from fastapi import Depends
from starlette.config import Config
import google_auth_oauthlib.flow
import requests
from urllib.parse import urlparse, urljoin
from urllib.parse import parse_qs
from app.api.deps import SessionDep
from app.crud import user_crud
from app.models.user_models import Message, NewPassword, Token, UserPublic
from app.core import security
from app.models.user_models import (
    Item,
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)

config = Config("../.env")  # Load from .env file
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET', default='')
GOOGLE_CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'

# Dynamically build the redirect URI based on the domain from settings
def get_redirect_uri(request: Request = None) -> str:
    # If we have a request object, use it to determine the base URL
    if request:
        base_url = str(request.base_url)
        # Remove trailing slash if present
        if base_url.endswith('/'):
            base_url = base_url[:-1]
        return f"{base_url}{settings.API_V1_STR}/auth/google/callback"
    
    # If no request is available, use the domain from settings
    if settings.ENVIRONMENT != "local":
        # In production or staging, use the domain from settings
        domain = getattr(settings, "DOMAIN", "api.cabwds.asia")
        return f"https://api.{domain}{settings.API_V1_STR}/auth/google/callback"
    else:
        # In local development, use localhost
        return f"http://localhost:8000{settings.API_V1_STR}/auth/google/callback"

flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file('google_client_secret.json',
    scopes=['https://www.googleapis.com/auth/drive.metadata.readonly',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'])

router = APIRouter(prefix="/auth", tags=["auth"])



@router.get("/google/login/")
async def google_login(request: Request):
    flow.redirect_uri = get_redirect_uri(request)

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
async def google_callback(session:SessionDep, request: Request, response: Response):

    authorization_response = request.url
    auth_code = parse_qs(authorization_response.query)['code'][0]
    url = "https://oauth2.googleapis.com/token"

    payload = {'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': get_redirect_uri(request),
        'grant_type': 'authorization_code'}

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    api_response = requests.request("POST", url, headers=headers, data=payload)
    ret = api_response.json()
    access_token = ret["access_token"]
    print(access_token)

    get_profile_url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token={}".format(access_token)
    api_response = requests.request("GET", get_profile_url)
    ret = api_response.json()
    name = ret['name']
    email = ret["email"]

    user = user_crud.get_user_by_email(session=session, email=email)
    if not user:
        # to create user after successful authentication
        if email == "cabwdswds@gmail.com":
            is_superuser = True
        else:
            is_superuser = False
        user_in = UserRegister(email=email, password="Password",full_name=name)
        user_create = UserCreate.model_validate(user_in)
        user_create.is_superuser = is_superuser
        user = user_crud.create_user(session=session, user_create=user_create)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    auth_token=security.create_access_token(user.id, expires_delta=access_token_expires, user_email=user.email, is_socialUser=True)

    response.set_cookie(key="access_token", value=access_token, httponly=False, max_age=300, samesite='none', domain='localhost')
    
    # Use settings.FRONTEND_HOST to build the redirect URL
    redirect_url = urljoin(settings.FRONTEND_HOST, f"/login?access_token={auth_token}")
    return RedirectResponse(url=redirect_url)

@router.get("/health-check/")
async def health_check() -> bool:
    return True