#ifndef NAMEPLACEHOLDER_HPP
# define NAMEPLACEHOLDER_HPP

class Nameplaceholder
{
	public:
		Nameplaceholder();
		Nameplaceholder(const Nameplaceholder &other);
		~Nameplaceholder();

		Nameplaceholder &operator=(const Nameplaceholder &rhs);
};

#endif