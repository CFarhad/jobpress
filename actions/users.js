"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { actionUser, fail, succeed, zodFieldErrors } from "@/lib/action-utils";
import { createUserSchema, setPasswordSchema, updateUserSchema } from "@/lib/validations/auth";

const refresh = () => revalidatePath("/dashboard/users");

export async function createUser(input) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));
  const { name, email, role, password } = parsed.data;

  try {
    await prisma.user.create({
      data: { name, email, role, isActive: true, passwordHash: await bcrypt.hash(password, 12) },
    });
  } catch (error) {
    if (error.code === "P2002") return fail("A user with this email already exists.", { email: "Already in use" });
    console.error("createUser failed:", error);
    return fail("Could not create the user.");
  }

  refresh();
  return succeed("User created.");
}

export async function updateUser(input) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));
  const { id, name, role, isActive } = parsed.data;

  // Guarantees at least one active admin always exists.
  if (id === auth.user.id && (role !== "ADMIN" || !isActive)) {
    return fail("You can't change your own role or disable your own account.");
  }

  try {
    await prisma.user.update({ where: { id }, data: { name, role, isActive } });
  } catch (error) {
    console.error("updateUser failed:", error);
    return fail("Could not update the user.");
  }

  refresh();
  return succeed("User updated.");
}

export async function setUserPassword(input) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;

  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));

  try {
    await prisma.user.update({
      where: { id: parsed.data.id },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    });
  } catch (error) {
    console.error("setUserPassword failed:", error);
    return fail("Could not change the password.");
  }

  return succeed("Password changed.");
}

export async function deleteUser(id) {
  const auth = await actionUser({ admin: true });
  if (auth.error) return auth.error;
  if (id === auth.user.id) return fail("You can't delete your own account.");

  try {
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
  } catch (error) {
    if (error.code === "P2003") {
      return fail("This user has created jobs or notes and can't be deleted. Disable the account instead.");
    }
    console.error("deleteUser failed:", error);
    return fail("Could not delete the user.");
  }

  refresh();
  return succeed("User deleted.");
}