import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows";

export default async function createAdminUser({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const authModuleService = container.resolve(Modules.AUTH);
  const userModuleService = container.resolve(Modules.USER);

  if (!args || args.length < 2) {
    logger.error("Usage: npx medusa exec <script> <email> <password>");
    return;
  }

  const email = args[0];
  const password = args[1];

  if (!email || !password) {
    logger.error("Missing required arguments: email and password");
    logger.error("Usage: npx medusa exec <script> <email> <password>");
    return;
  }

  if (!email || !password) {
    logger.error("--email and --password must have values");
    return;
  }

  logger.info(`Creating admin user: ${email}`);

  const [existingUser] = await userModuleService.listUsers({ email });

  if (!existingUser) {
    const authIdentity = await authModuleService.register("emailpass", {
      body: { email, password },
    } as any);

    await createUserAccountWorkflow(container).run({
      input: {
        authIdentityId: authIdentity.authIdentity!.id,
        userData: { email },
      },
    });

    logger.info(`Admin user created: ${email}`);
  } else {
    logger.info(`Admin user already exists: ${email}, skipping.`);
  }
}
