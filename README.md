# Treeter (backend) 🌳

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

Backend for Treeter. Stores, retrieves and adjusts user account information, posts, and comments from a MongoDB database. Uses bcrypt to hash account passwords and protects routes using a JWT token.

## Deployment 🚀

https://treeter-api.vercel.app/

## API Reference 🧩

#### Create new account

```http
  POST /register
```

| Parameter  | Type     | Description                                         |
| :--------- | :------- | :-------------------------------------------------- |
| `username` | `string` | **Required**. Username to create a new account with |
| `password` | `string` | **Required**. Password to create a new account with |

#### Get an account's information (including JWT token to use other routes)

```http
  POST /login
```

| Parameter  | Type     | Description                                               |
| :--------- | :------- | :-------------------------------------------------------- |
| `username` | `string` | **Required**. Username of account to get information from |
| `password` | `string` | **Required**. Password of account to get information from |

#### Change user's profile picture

```http
  POST /updateProfilePicture
```

| Parameter | Type     | Description                                                                         |
| :-------- | :------- | :---------------------------------------------------------------------------------- |
| `image`   | `string` | **Required**. Base64 string of an image to be used as the user's profile picture    |
| `token`   | `string` | **Required**. JWT token in the header used to identify which user account to update |

#### Get user's profile picture

```http
  POST /getProfilePicture
```

| Parameter  | Type     | Description                                                                       |
| :--------- | :------- | :-------------------------------------------------------------------------------- |
| `username` | `string` | **Required**. Username of user to retrieve profile picture from                   |
| `token`    | `string` | **Required**. JWT token in the header to confirm request is from a logged in user |

#### Get all posts

```http
  GET /posts
```

| Parameter | Type     | Description                                                                       |
| :-------- | :------- | :-------------------------------------------------------------------------------- |
| `token`   | `string` | **Required**. JWT token in the header to confirm request is from a logged in user |

#### Create a post

```http
  POST /posts
```

| Parameter   | Type     | Description                                                                               |
| :---------- | :------- | :---------------------------------------------------------------------------------------- |
| `content`   | `string` | Text message in new post                                                                  |
| `image`     | `string` | Image in new post                                                                         |
| `timestamp` | `string` | **Required**. Time at which post is created                                               |
| `token`     | `string` | **Required**. JWT token in the header used to identify which user account post belongs to |

#### Add a "view" to a post

```http
  POST /posts/:postId/view
```

| Parameter | Type     | Description                                                                       |
| :-------- | :------- | :-------------------------------------------------------------------------------- |
| `:postId` | `string` | PostID of the post to add a "view" to                                             |
| `token`   | `string` | **Required**. JWT token in the header to confirm request is from a logged in user |

#### Delete a post

```http
  POST /posts/:postId/delete
```

| Parameter | Type     | Description                                                                                     |
| :-------- | :------- | :---------------------------------------------------------------------------------------------- |
| `:postId` | `string` | **Required**. ID of the post/comment to delete                                                  |
| `token`   | `string` | **Required**. JWT token in the header to confirm request is from the user that created the post |

#### Add/remove a "like" to/from a post

```http
  POST /posts/:postId/like
```

| Parameter | Type     | Description                                                                           |
| :-------- | :------- | :------------------------------------------------------------------------------------ |
| `:postId` | `string` | **Required**. ID of the post/comment to add/remove a "like" to/from                   |
| `token`   | `string` | **Required**. JWT token in the header to get the user that "liked"/"unliked" the post |

#### Add a comment to a post/comment

```http
  POST /posts/:postId/comment
```

| Parameter   | Type     | Description                                                                                  |
| :---------- | :------- | :------------------------------------------------------------------------------------------- |
| `:postId`   | `string` | **Required**. ID of the post/comment to add a comment to                                     |
| `content`   | `string` | Text message in new post                                                                     |
| `image`     | `string` | Image in new post                                                                            |
| `timestamp` | `string` | **Required**. Time at which post is created                                                  |
| `token`     | `string` | **Required**. JWT token in the header used to identify which user account comment belongs to |

#### Get information from a post

```http
  GET /posts/:postId
```

| Parameter | Type     | Description                                                                       |
| :-------- | :------- | :-------------------------------------------------------------------------------- |
| `:postId` | `string` | **Required**. ID of the post/comment to fetch information from                    |
| `token`   | `string` | **Required**. JWT token in the header to confirm request is from a logged in user |

#### Get all post information information from an array of postIDs

```http
  POST /posts/array
```

| Parameter | Type       | Description                                                                       |
| :-------- | :--------- | :-------------------------------------------------------------------------------- |
| `array`   | `[string]` | **Required**. Array of post/comment IDs to fetch information from                 |
| `token`   | `string`   | **Required**. JWT token in the header to confirm request is from a logged in user |

## Related

- [Treeter Frontend](https://github.com/ClearlyyConfused/treeter)
