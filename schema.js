export const typeDefs = `#graphql
    type Author {
        name: String!,
        id: ID!,
        born: Int,
        books: Int
    }
    type Book {
        title: String!
        published: Int!
        author: String!
        id: ID!
        genres: [String!]!
    }

    type Query{
        bookCount: Int!
        authorCount: Int!
        allBooks(author:String,genres:String): [Book!]!
        allAuthors:[Author!]!
    }

    type Mutation{
        addBook(book:NewBook!):Book
        editAuthor(id:ID!,info:AuthorInfo):Author
        setBirthYear(name:String!,year:Int!):Author
    }

    input AuthorInfo{
        name: String
        born: Int
    }

    input NewBook {
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
    }

`
