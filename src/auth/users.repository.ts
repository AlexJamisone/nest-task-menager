import { DataSource, Repository } from 'typeorm';
import {
	Injectable,
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository extends Repository<User> {
	constructor(private dataSource: DataSource) {
		super(User, dataSource.createEntityManager());
	}
	async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
		const { password, username } = authCredentialsDto;
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const user = this.create({
			username,
			password: hashedPassword,
		});

		try {
			await this.save(user);
		} catch (error) {
			//duplicate username or server error
			console.log(typeof error.code);
			if (error.code === '23505') {
				throw new ConflictException('User already exitsts');
			} else {
				throw new InternalServerErrorException();
			}
		}
	}
}
