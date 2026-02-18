import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getActiveAccounts,
  getAccountById,
  getAccountsBySellerId,
  createAccount,
  updateAccount,
  getUserPurchases,
  getUserSales,
  createPurchase,
  getAccountReviews,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  accounts: router({
    list: publicProcedure
      .input(
        z.object({
          type: z.enum(["tiktok", "youtube", "instagram"]).optional(),
          minFollowers: z.number().optional(),
          maxFollowers: z.number().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
        })
      )
      .query(({ input }) =>
        getActiveAccounts({
          type: input.type,
          minFollowers: input.minFollowers,
          maxFollowers: input.maxFollowers,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
        })
      ),

    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getAccountById(input)),

    getMySales: protectedProcedure.query(({ ctx }) =>
      getAccountsBySellerId(ctx.user.id)
    ),

    create: protectedProcedure
      .input(
        z.object({
          type: z.enum(["tiktok", "youtube", "instagram"]),
          name: z.string().min(1),
          username: z.string().min(1),
          followers: z.number().min(0),
          ageMonths: z.number().min(0),
          price: z.number().min(0),
          description: z.string().optional(),
          engagementRate: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createAccount({
          ...input,
          sellerId: ctx.user.id,
          status: "active",
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          engagementRate: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const account = await getAccountById(input.id);
        if (!account || account.sellerId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return updateAccount(input.id, input);
      }),
  }),

  purchases: router({
    getMyPurchases: protectedProcedure.query(({ ctx }) =>
      getUserPurchases(ctx.user.id)
    ),

    getMySales: protectedProcedure.query(({ ctx }) =>
      getUserSales(ctx.user.id)
    ),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          price: z.number(),
          sellerId: z.number(),
        })
      )
      .mutation(({ ctx, input }) =>
        createPurchase({
          accountId: input.accountId,
          buyerId: ctx.user.id,
          sellerId: input.sellerId,
          price: input.price,
          status: "pending",
        })
      ),
  }),

  reviews: router({
    getByAccount: publicProcedure
      .input(z.number())
      .query(({ input }) => getAccountReviews(input)),
  }),
});

export type AppRouter = typeof appRouter;
