import data from "./data.js"
import {GraphQLError} from "graphql"
export const resolvers = {
    Query: {
        bookCount() {
            return data.books.length
        },
        authorCount() {
            return data.authors.length
        },
        allBooks(_, args) {
            if (!args.author && !args.genres) {
                return data.books
            }
            if (args.author && args.genres) {
                console.log("Both")
                return data.books.filter(
                    (book) =>
                        book.author === args.author &&
                        book.genres.includes(args.genres)
                )
            }
            if (args.genres) {
                return data.books.filter((book) =>
                    book.genres.includes(args.genres)
                )
            }
            if (args.author) {
                return data.books.filter((book) => book.author === args.author)
            }
        },
        allAuthors() {
            return data.authors
        },
    },
    Author: {
        books(parent) {
            return data.books.filter((book) => book.author === parent.name)
                .length
        },
    },
    Mutation: {
        addBook(_, args) {
            const id = Math.floor(Math.random() * 100)
            const isAlreadyExist = data.authors.find(
                (author) => author.name === args.book.author
            )

            if (!isAlreadyExist) {
                data.authors.push({id, name: args.book.author})
            }
            const newBook = {...args.book, id}
            data.books.push(newBook)
            return newBook
        },
        editAuthor(_, args) {
            let foundAuthor = data.authors.find(
                (author) => author.id === args.id
            )

            if (!foundAuthor) {
                throw new GraphQLError("Author Not Found", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.id,
                    },
                })
            }

            foundAuthor = {...foundAuthor, ...args.info}

            return foundAuthor
        },
        setBirthYear(_, args) {
            const foundAuthor = data.authors.find(
                (author) => author.name === args.name
            )
            if (!foundAuthor) {
                throw new GraphQLError("Author Not Found")
            }
            const editedAuthor = {...foundAuthor, born: args.year}
            data.authors.forEach((author) => {
                if (author.name === args.name) {
                    author.born = editedAuthor.born
                }
            })

            return editedAuthor
        },
    },
}
