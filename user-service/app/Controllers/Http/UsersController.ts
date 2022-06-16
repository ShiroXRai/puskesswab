// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";

export default class UsersController {
  public async index({ request, response, auth }: HttpContextContract) {
    try {
      await auth.authenticate();
      const page = request.input("page", 1);
      return await User.query().where("dihapus", 0).paginate(page, 50);
    } catch (error) {
      return response.notFound(error);
    }
  }

  public async register({ request, auth, response }: HttpContextContract) {
    try {
      // const validationSchema = schema.create({
      //   email: schema.string([
      //     rules.email(),
      //     rules.normalizeEmail({
      //       allLowercase: true,
      //       gmailRemoveSubaddress: true,
      //     }),
      //   ]),
      //   password: schema.string({}, [
      //     rules.minLength(6),
      //     rules.confirmed("konfirmasi_password"),
      //   ]),
      // });
      // const validatedData = await request.validate({
      //   schema: validationSchema,
      // });
      // const user = await User.create(validatedData);
      // return await auth.login(user);
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async login({ request, response, auth }: HttpContextContract) {
    try {
      const { email, password } = request.body();
      return await auth.attempt(email, password);
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.ok({ message: "Logout Berhasil" });
  }

  public async show({ params: { id } }: HttpContextContract) {
    return await User.findOrFail(id);
  }

  public async update({
    request,
    response,
    params: { id },
    auth,
  }: HttpContextContract) {
    try {
      await auth.authenticate();
      const {
        nama,
        cabor,
        sosial_media,
        umur,
        kebangsaan,
        deskripsi,
        nomor_whatsapp,
      } = request.body();
      return await User.query().where({ id }).update({
        nama: nama,
        cabor: cabor,
        sosialMedia: sosial_media,
        umur: umur,
        kebangsaan: kebangsaan,
        deskripsi: deskripsi,
        nomorWhatsapp: nomor_whatsapp,
      });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async destroy({ params: { id } }: HttpContextContract) {
    return await User.query().where({ id }).update({
      dihapus: 1,
    });
  }
}
