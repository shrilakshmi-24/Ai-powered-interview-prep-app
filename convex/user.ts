import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
    args: { 
        name: v.string(), 
        email: v.string(), 
        image: v.optional(v.string()) 
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        
        if (existingUser) {
            return {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                image: existingUser.image,
            };
        }
        
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            image: args.image,
        });
        
        return {
            id: userId,
            name: args.name,
            email: args.email,
            image: args.image,
        };
    }
});
