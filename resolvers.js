import data from "./data.js"
import {GraphQLError} from "graphql"
import Person from "./model/person.js"
import User from "./model/user.js"
import jwt from "jsonwebtoken"
export const resolvers = {
    Query: {
        personCount: async () => Person.collection.countDocuments(),
        allPersons: async (_, args, context) => {
            console.log({context}, "End Part")
            if (!args.phone) {
                return Person.find({})
            }
            return Person.find({phone: {$exists: args.phone === "YES"}})
        },
        currentLoggedInUser: async (_, args, context) => {
            console.log(context)
            return context.currentUser
        },

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
        addPerson: async (_, args, context) => {
            console.log(args)
            const newPerson = new Person({...args.person})
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }
            try {
                await newPerson.save()
                currentUser.friends = currentUser.friends.concat(newPerson)
                await currentUser.save()
            } catch (err) {
                console.log(err, "\n")
                console.log(err.message)
                throw new GraphQLError("Saving Person Failed", {
                    extensions: {
                        code: "Invalid args",
                        invalidArgs: args.person,
                        err,
                    },
                })
            }
            return newPerson
        },
        createUser: async (_, args) => {
            const foundUser = await User.findOne({username: args.username})
            console.log({foundUser, args})
            if (foundUser) throw new GraphQLError("User already exists!")
            const newUser = new User({...args})
            return newUser.save().catch((err) => {
                throw new GraphQLError("Create User Failed!", {
                    extensions: {
                        err,
                    },
                })
            })
        },
        loginUser: async (_, args) => {
            console.log(args)
            const foundUser = await User.findOne({
                username: args.username,
                password: args.password,
            })
            if (!foundUser) throw new GraphQLError("No User Found!")
            const value = jwt.sign(
                {id: foundUser.id, username: foundUser.username},
                process.env.JWT_SECRET
            )
            return {value}
        },
        addFriend: async (_, args, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                })
            }
            const foundPerson = await Person.findOne({name: args.name})
            console.log({foundPerson, args})
            const isFriend = currentUser.friends
                .map((friend) => friend._id.toString())
                .includes(foundPerson._id.toString())
            if (!isFriend) {
                console.log("Save as Friend")
                currentUser.friends = currentUser.friends.concat(foundPerson)
                await currentUser.save()
            }
            return currentUser
        },
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
