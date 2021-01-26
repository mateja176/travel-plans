const _ = require('lodash');

module.exports = async (ctx, next) => {
  let role;

  if (ctx.state.user) {
    // request is already authenticated in a different way
    return next();
  }

  if (ctx.request && ctx.request.header && ctx.request.header.authorization) {
    try {
      const { id } = await strapi.plugins[
        'users-permissions'
      ].services.jwt.getToken(ctx);

      if (id === undefined) {
        throw new Error('Invalid token: Token did not contain required fields');
      }

      // fetch authenticated user
      ctx.state.user = await strapi.plugins[
        'users-permissions'
      ].services.user.fetchAuthenticatedUser(id);
    } catch (err) {
      return handleErrors(ctx, err, 'unauthorized');
    }

    if (!ctx.state.user) {
      return handleErrors(ctx, 'User Not Found', 'unauthorized');
    }

    role = ctx.state.user.role;

    if (role.type === 'root') {
      return await next();
    }

    const store = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    if (
      _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
      !ctx.state.user.confirmed
    ) {
      return handleErrors(
        ctx,
        'Your account email is not confirmed.',
        'unauthorized',
      );
    }

    if (ctx.state.user.blocked) {
      return handleErrors(
        ctx,
        'Your account has been blocked by the administrator.',
        'unauthorized',
      );
    }

    // * CUSTOM VALIDATION

    // disable role update if the user is not an admin
    const usersPathMatch = ctx.path.match(/^\/users\/(?<id>\d+)$/);
    if (
      ctx.state.user.role.name !== 'Admin' &&
      usersPathMatch &&
      ctx.request.method === 'PUT' &&
      ctx.request.body.role
    ) {
      return handleErrors(
        ctx,
        'User is not allowed to update role.',
        'forbidden',
      );
    }
    // users may only access their personal trips
    const tripsPathMatch = ctx.path.match(/^\/trips$/);
    if (tripsPathMatch && ctx.state.user.role.name === 'Authenticated') {
      if (ctx.request.query['user.id'] !== String(ctx.state.user.id)) {
        return handleErrors(
          ctx,
          'User is only allowed to access their personal trips.',
          'forbidden',
        );
      }
    }
    // managers are not allowed to update admins
    if (
      usersPathMatch &&
      ctx.request.method !== 'GET' &&
      ctx.state.user.role.name === 'Manager'
    ) {
      const {
        groups: { id },
      } = usersPathMatch;

      const user = await strapi
        .query('plugins::users-permissions.user')
        .findOne({ id });

      if (!user) {
        return handleErrors(ctx, 'User not found.', 'notFound');
      } else {
        if (user.role.name === 'Admin') {
          handleErrors(
            ctx,
            // eslint-disable-next-line quotes
            'Managers are only allowed to update regular users.',
            'forbidden',
          );
        }
      }
    }

    const tripPathMatch = ctx.path.match(/^\/trips\/(?<id>\d+)$/);
    // managers are not allowed to update admins' trips
    if (
      tripPathMatch &&
      ctx.request.method !== 'GET' &&
      ctx.state.user.role.name === 'Manager'
    ) {
      const {
        groups: { id },
      } = tripPathMatch;

      const trip = await strapi.query('trip').findOne({ id });

      if (!trip) {
        return handleErrors(ctx, 'Trip not found.', 'notFound');
      } else {
        if (trip.user.role === 'Admin') {
          handleErrors(
            ctx,
            // eslint-disable-next-line quotes
            "Managers are only allowed to regular users' trips.",
            'forbidden',
          );
        }
      }
    }

    // trips starting date must be in the future and trips end date must be greater than the trip's starting date
    if (
      tripPathMatch &&
      ['POST', 'PATCH', 'PUT'].includes(ctx.request.method) &&
      (ctx.request.body.startDate || ctx.request.body.endDate)
    ) {
      if (ctx.request.body.startDate && !ctx.request.body.endDate) {
        return handleErrors(
          ctx,
          'startDate and endDate may only be updated together, but endDate is missing.',
          'forbidden',
        );
      }
      if (!ctx.request.body.startDate && ctx.request.body.endDate) {
        return handleErrors(
          ctx,
          'startDate and endDate may only be updated together, but startDate is missing.',
          'forbidden',
        );
      }

      const startDate = new Date(ctx.request.body.startDate);
      if (Date.now() - startDate.getTime() >= 0) {
        return handleErrors(
          ctx,
          'startDate must be in the future.',
          'forbidden',
        );
      }
      const endDate = new Date(ctx.request.body.endDate);
      if (startDate.getTime() - endDate.getTime() >= 0) {
        return handleErrors(
          ctx,
          'endDate must be greater than the startDate.',
          'forbidden',
        );
      }
    }
  }

  // Retrieve `public` role.
  if (!role) {
    role = await strapi
      .query('role', 'users-permissions')
      .findOne({ type: 'public' }, []);
  }

  const route = ctx.request.route;
  const permission = await strapi
    .query('permission', 'users-permissions')
    .findOne(
      {
        role: role.id,
        type: route.plugin || 'application',
        controller: route.controller,
        action: route.action,
        enabled: true,
      },
      [],
    );

  if (!permission) {
    return handleErrors(ctx, undefined, 'forbidden');
  }

  // Execute the policies.
  if (permission.policy) {
    return await strapi.plugins['users-permissions'].config.policies[
      permission.policy
    ](ctx, next);
  }

  // Execute the action.
  await next();
};

const handleErrors = (ctx, err = undefined, type) => {
  throw strapi.errors[type](err);
};
