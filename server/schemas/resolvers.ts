import { AuthenticationError } from 'apollo-server-express';
import User from '../src/models/User';
import { signToken } from '../utils/auth';
import { UserDocument } from '../src/models/User';
interface Context {
    user?: {
        _id: string;
        username: string;
        email: string;
    };
}

interface AddUserArgs {
    username: string;
    email: string;
    password: string;
}

interface LoginArgs {
    email: string;
    password: string;
}

interface SaveBookArgs {
    input: any; // Replace 'any' with the actual type of 'input' if known
}

interface RemoveBookArgs {
    bookId: string;
}

export const resolvers = {
    Query: {
        me: async (_: any, __: any, context: Context): Promise<UserDocument | null> => {
            if (context.user) {
                return await User.findById(context.user._id);
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        addUser: async (_: any, { username, email, password }: AddUserArgs): Promise<{ token: string; user: UserDocument }> => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (_: any, { email, password }: LoginArgs): Promise<{ token: string; user: UserDocument }> => {
            const user = await User.findOne({ email });
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_: any, { input }: SaveBookArgs, context: Context): Promise<UserDocument | null> => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    context.user._id,
                    { $push: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (_: any, { bookId }: RemoveBookArgs, context: Context): Promise<UserDocument | null> => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};
