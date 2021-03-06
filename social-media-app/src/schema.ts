import { gql } from 'apollo-server';

const typeDefs = gql`
    type Query {
        me: UserPayload!
        posts: [Post!]!
        profile(userId: ID!): ProfilePayload
    }
    type ProfilePayload {
        userErrors: [UserError!]!
        profile: Profile!
        isMyProfile: Boolean!
    }
    type Post {
        id: ID!
        title: String!
        content: String!
        createdAt: String!
        published: Boolean!
        user: User!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        posts: [Post!]!
    }
    type Profile {
        id: ID!
        bio: String!
        user: User!
    }
    type Mutation {
        postCreate(post: PostInput!): PostPayload!
        postUpdate(postId: ID!, post: PostInput!): PostPayload!
        postDelete(postId: ID!): PostPayload!
        postPublish(postId: ID!): PostPayload!
        postUnpublish(postId: ID!): PostPayload!
        signUp(credentials: CredentialsInput, name: String!, bio: String): AuthPayload!
        signIn(credentials: CredentialsInput): AuthPayload!
    }
    input PostInput {
        title: String
        content: String
        published: Boolean
    }
    input CredentialsInput {
        email: String!, password: String!
    }
    type PostPayload {
        userErrors: [UserError!]!
        post: Post
    }
    type AuthPayload {
        userErrors: [UserError!]!
        token: String
    }
    type UserPayload {
        userErrors: [UserError!]!
        user: User
    }
    type UserError {
        message: String!
    }
`;

export {
    typeDefs,
};