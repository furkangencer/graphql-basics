import {GraphQLServer} from "graphql-yoga"
import uuidv4 from "uuid/v4" // We're using this package to generate random ID's

// Scalar Types - String, Boolean, Int, Float, ID

// Dummy user data
const users = [
    {
        id: '1',
        name: 'Steve',
        email: 'steve.jobs@apple.com',
        age: 55
    },
    {
        id: '2',
        name: 'Mark',
        email: 'mark.zuckerberg@facebook.com'
    },
    {
        id: '3',
        name: 'Elon',
        email: 'elon.musk@tesla.com'
    }
]

// Dummy post data
const posts = [
    {
        id: '10',
        title: 'GraphQL 101',
        body: 'Welcome to GraphQL course',
        published: true,
        author: '1'
    },
    {
        id: '11',
        title: 'Node.js 101',
        body: 'Welcome to Node.js course',
        published: true,
        author: '1'
    },
    {
        id: '12',
        title: 'Angular 101',
        body: '',
        published: false,
        author: '2'
    },
]

// Dummy comments data
const comments = [
    {
        id: '102',
        text: "She's got a smile that it seems to me...Reminds me of childhood memories..",
        author: '1',
        post: '10'
    },
    {
        id: '103',
        text: "Maybe I'm too busy being yours to fall for somebody new...",
        author: '1',
        post: '10'
    },
    {
        id: '104',
        text: "I used to love her...But I had to kill her...",
        author: '2',
        post: '11'
    },
    {
        id: '105',
        text: "But life still goes on...I want to break free...",
        author: '3',
        post: '12'
    },
]

// Type Definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post]!
        comments: [Comment!]!
        me: User!
        post: Post!
    }
    type Mutation {
        createUser(data: CreateUserInput!): User!
        createPost(data: CreatePostInput!): Post!
        createComment(data: CreateCommentInput!): Comment!
    }
    
    input CreateUserInput {
        name: String!,
        email: String!,
        age: Int,
    }
    
    input CreatePostInput {
        title: String!,
        body: String!,
        published: Boolean!,
        author: ID!
    }
    
    input CreateCommentInput {
        text: String!,
        author: ID!,
        post: ID!
    }
    
    type User {
        id: ID!
        name: String!
        email: String!
        age: Int,
        posts: [Post!]!
        comments: [Comment!]!
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }
    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`

// Resolvers
const resolvers = {
    Query: {
        users(parents, args, ctx, info) {
            if (!args.query) { // Notice that 'query' is defined as a parameter name in type-def string (Line 53)
                return users
            }
            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts(parents, args, ctx, info) {
            if (!args.query) {
                return posts
            }
            return posts.filter((post) => {
                const isTitleMatch = post.title.toLowerCase().includes(args.query.toLowerCase())
                const isBodyMatch = post.body.toLowerCase().includes(args.query.toLowerCase())
                return  isTitleMatch || isBodyMatch
            })
        },
        comments(parents, args, ctx, info) {
            return comments
        },
        me() {
            return {
                id: '123abc',
                name: 'John',
                email: 'john@doe.com',
                // age: 25
            }
        },
        post() {
            return {
                id: 'q2ewqw',
                title: 'GraphQL 101',
                body: 'Welcome',
                published: true
            }
        }
    },
    Mutation: {
        createUser(parent, args, ctx, info) {
            const emailTaken = users.some((user) => {
                return user.email === args.data.email
            })
            if (emailTaken) {
                throw new Error('Email taken.')
            }
            const user = {
                id: uuidv4(), // new random id
                ...args.data
            }
            users.push(user)

            return user;
        },
        createPost(parent, args, ctx, info) {
            const userExists = users.some((user) => {
                return user.id === args.data.author
            })
            if (!userExists) {
                throw new Error('User doesn\'t exist.')
            }
            const post = {
                id: uuidv4(), // new random id
                ...args.data
            }
            posts.push(post)

            return post;
        },
        createComment(parent, args, ctx, info) {
            const userExists = users.some((user) => user.id === args.data.author)
            const postExists = posts.some((post) => post.id === args.data.post && post.published === true)
            if (!userExists || !postExists) {
                throw new Error('User or Post doesn\'t exist.')
            }
            const comment = {
                id: uuidv4(), // new random id
                ...args.data
            }
            comments.push(comment)

            return comment;
        }
    },
    Post: { //Here we're defining the resolver methods of the type "Post".
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id
            })
        }
    },
    User: { //Here we're defining the resolver methods of the type "User".
        posts(parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id
            })
        },
        comments(parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id
            })
        }
    },
    Comment: { //Here we're defining the resolver methods of the type "Comment".
        author(parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author
            })
        },
        post(parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({
    typeDefs: typeDefs,
    resolvers: resolvers
})

server.start(() => {
    console.log('The server is up on port 4000!');
})