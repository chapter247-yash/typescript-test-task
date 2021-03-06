import { FastifyRequest, FastifyReply } from "fastify";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import dbConnection from "@server/utills/db.connection";
import { getRepository } from "typeorm";
import { Users } from "@server/entities";
/**
 *
 * @param req
 * @param res
 */
const login = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { username, password } = req.body as any;
    await dbConnection;

    const userRepository = getRepository(Users);
    const user = await userRepository.findOne({ username });
    console.log(user);
    if (!user) {
      return res
        .status(401)
        .send({ message: "Username and password didn't match." });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .send({ message: "Username and password didn't match." });
    }
    const token = sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2m",
      }
    );
    return res.status(200).send({ token, expires: 2 * 60 * 1000 });
  } catch (error) {
    console.log(error);
    // prepare error message
    let message = "An error occure while completing your request.";
    if (error.message) {
      message = error.message;
    }
    return res.status(500).send({ message });
  }
};
/**
 *
 * @param req
 * @param res
 */
const refreshToken = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const user = (req as any).user;
    const token = sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2m",
      }
    );
    return res.status(200).send({ token, expires: 2 * 60 * 1000, user });
  } catch (error) {
    console.log(error);
    // prepare error message
    let message = "An error occure while completing your request.";
    if (error.message) {
      message = error.message;
    }
    return res.status(500).send({ message });
  }
};
/**
 *
 */
export default {
  login,
  refreshToken,
};
