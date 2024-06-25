# Linum labs test assignment

Application description:
Mini social app exposing REST API enpoints

Steps to run this project:

1. Setup database `npm run init`
2. Run `npm run start` (sets up database automatically)
3. Run in dev mode `npm run dev` (sets up database automatically)
4. Run tests `npm run test`

# API Endpoints

### Create a User

POST /api/signup

- Sign up to the system (username, password)

```
{
    "username": "tester",
    "password": "test123"
}
```

- Responses:
- [201 Created]

```
{
    "message": "User created"
}
```

- [500 Internal Server Error]

```
{
    "message": "Error creating user: duplicate key value violates unique constraint \"UQ_78a916df40e02a9deb1c4b75edb\""
}
```

### Login

POST /api/login

- Logs in an existing user with a password

```
{
    "username": "tester",
    "password": "test123"
}
```

- Responses:
- [200 OK]

```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsInVzZXJuYW1lIjoiYSIsImlhdCI6MTcxOTMzODQ2OCwiZXhwIjoxNzE5MzQyMDY4fQ.gN8IKRExtS17L1-_EW5B482vEccNI1oMdmf6wLJSh_g"
}
```

- [401 Unauthorized]

```
{
    "message": "Invalid credentials"
}
```

### Retrieve a User by ID

GET /api/me

- Get the currently logged in user information (username and number of followers)

- Responses:
- [200 OK]

```
Authentication token + request payload:
{
    "username": "tester",
    "followersCount": 0
}
```

### Update password

PUT /api/me/update-password

- Update the current users password

```
Authentication token + request payload:
{
  "password": "new_password",
}
```

- Responses:
- [200 OK]

```
{
    "message": "Password updated"
}
```

### List username & number of followers of a user

GET /api/user/:id

- List username & number of followers of a user

```
Authentication token
```

- Responses:
- [200 OK]

```
{
    "username": "a",
    "followersCount": 0
}
```

- [404 Not Found] if user not found

```
{
    "message": "User not found"
}
```

### Like a user

POST /user/:id/follow

```
Authentication token
```

- Responses:
- [200 OK]

```
{
    "message": "User followed"
}
```

- [404 Not Found] if user not found

```
{
    "message": "User not found"
}
```

- [400 Bad Request] If already following

```
{
    "message": "Already following this user"
}
```

### Un-Like a user

POST /user/:id/unfollow

```
Authentication token
```

- Responses:
- [200 OK]

```
{
    "message": "User unfollowed"
}
```

- [404 Not Found] if user not found

```
{
    "message": "User not found"
}
```

### Create message

POST /user/:id/create-message

```
Authentication token + request payload:
{
  "message": "Hello",
}
```

- Responses:
- [200 OK]

```
{
    "message": "Message sent"
}
```

- [404 Not Found] if user not found

```
{
    "message": "User not found"
}
```

### List users in a most liked to least liked

GET /api/most-followed

- List users in a most liked to least liked

```
Authentication token
```

- Responses:
- [200 OK]

```
[
    {
        "id": 11,
        "username": "b",
        "followersCount": 10
    },
    {
        "id": 10,
        "username": "a",
        "followersCount": 1
    },
...
]
```
