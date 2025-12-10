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
            return existingUser._id;
        }
        
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            image: args.image,
        });
        
        return userId;
    }
});
