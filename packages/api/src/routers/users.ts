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
            { handle: { contains: q.replace(/^#/, "").toLowerCase(), mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          handle: true,
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
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      }));
    }),

  /**
   * Récupère un utilisateur par son ID (cuid) ou son handle.
   * Accepte: cuid brut, handle brut ("piet1234"), ou handle préfixé ("#piet1234").
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const raw = input.id.trim();
      const handleCandidate = raw.replace(/^#/, "").toLowerCase();

      const user = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ id: raw }, { handle: handleCandidate }],
        },
        select: {
          id: true,
          handle: true,
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
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      };
    }),

  /**
   * Récupère un utilisateur par son handle public ("piet1234").
   * Tolère le préfixe "#" optionnel.
   */
  getByHandle: protectedProcedure
    .input(z.object({ handle: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const handle = input.handle.trim().replace(/^#/, "").toLowerCase();

      const user = await ctx.prisma.user.findUnique({
        where: { handle },
        select: {
          id: true,
          handle: true,
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

      if (!user) return null;

      return {
        id: user.id,
        handle: user.handle,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.profile?.avatarUrl,
      };
    }),

  /**
   * Récupère le handle de l'utilisateur authentifié.
   * Utilisé par les pages de profil/settings pour afficher le QR.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, handle: true, name: true, email: true, image: true },
    });
    return user;
  }),
});

export type UsersRouter = typeof usersRouter;