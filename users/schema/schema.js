const graphql = require('graphql');
const axios = require('axios')
const _ = require('lodash');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

// const users = [
//     { id: '23', firstName: 'Bill', age: 20 },
//     { id: '47', firstName: 'John', age: 20 },
// ]

const companyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(userType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data)
            }
        }
    })
})

const userType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: companyType,
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data)
            }
        }
    })
});



// const RootQuery = new GraphQLObjectType({
//     name: 'RootQueryType',
//     fields: {
//         user: {
//             type: userType,
//             args: { id: { type: GraphQLString } },
//             resolve(parentValue, args) {
//                 return _.find(users, { id: args.id })

//             }
//         }
//     }
// });

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: userType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(response => response.data)

            }
        },
        company: {
            type: companyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(response => response.data)
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: userType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }

            },
            resolve(parentValue, { firstName, age }) {
                return axios.post('http://localhost:3000/users', { firstName, age })
                    .then(res => res.data);
            }
        },
        deleteUser: {
            type: userType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }

            },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },
        editUser: {
            type: userType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`,args)
                    .then(res => res.data);
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})