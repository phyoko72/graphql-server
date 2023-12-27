export const typeDefs = `#graphql

    type Person {
        name: String!,
        phone: String,
        street: String!,
        city: String!,
        id: ID!
    }

    type User {
        username: String!
        password: String!
        friends: [Person!]!
        id: ID!
    }

    type Token {
        value: String!
    }

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

    enum HasPhone{
      YES
      NO
    }

    type Query{
        personCount: Int!
        allPersons(phone:HasPhone):[Person]!
        currentLoggedInUser: User

        
        bookCount: Int!
        authorCount: Int!
        allBooks(author:String,genres:String): [Book!]!
        allAuthors:[Author!]!
    }

    type Mutation{
        addPerson(person:AddPerson!):Person
        createUser(username:String!,password:String!):User
        loginUser(username:String!,password:String!):Token
        addFriend(name:String!):User

        addBook(book:NewBook!):Book
        editAuthor(id:ID!,info:AuthorInfo):Author
        setBirthYear(name:String!,year:Int!):Author
    }

    input AddPerson{
        name: String!,
        phone: String,
        street: String!,
        city: String!,
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
