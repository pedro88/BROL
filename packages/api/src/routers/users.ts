/**
 * Router Users - Recherche et lookup d'utilisateurs Brol.
 * @package @brol/api
 */

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const usersRouter = router({
  /**
   * Recherche des utilisateurs par nom ou email.
   * Utilisé pour le sélectionneur d'emprunteur dans la modal de prêt.
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(255),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;
      const q = query.trim();

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
        take: 20,
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      }));
    }),

  /**
   * Récupère un utilisateur par son ID.
   * Utilisé pour le lookup direct (ID tapé ou QR scan).
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      };
    }),
});

export type UsersRouter = typeof usersRouter;