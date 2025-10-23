import { IUniqueIdGenerator } from '@application/providers/IUniqueIdGenerator';
import cuid from 'cuid';

export class UniqueIdGenerator implements IUniqueIdGenerator {
	private readonly displayNameSize = 15;
	private readonly prefix = 'User';

	generate(): string {
		return cuid();
	}

	generateDisplayName(): string {
		const num = this.getRandomDigits(this.displayNameSize - this.prefix.length);
		return `${this.prefix}${num}`;
	}

	private getRandomDigits(size: number): string {
		const num = Math.floor(Math.random() * (10 ** size));
		const digits = num.toString().padStart(size, '0');
		return digits;
	}
}