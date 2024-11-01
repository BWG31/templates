NAME	=	#executable name

SRC		=	#source files

INC_DIR		:=	inc/
SRC_DIR		:=	src/
OBJ_DIR		:=	obj/
DEP_DIR 	:=	dep/

CC			:=	c++
CFLAGS		:=	-Wall -Wextra -Werror -std=c++98
DFLAGS		:=	-MMD -MF
DEP_FILE	=	$(DEP_DIR)$*.d
RM			:=	rm -r

SRCS	:=	$(addprefix $(SRC_DIR), $(addsuffix .cpp, $(SRC)))
OBJS	:=	$(addprefix $(OBJ_DIR), $(addsuffix .o, $(SRC)))
DEPS	:=	$(addprefix $(DEP_DIR), $(addsuffix .d, $(SRC)))

INCLUDES	=	-I $(INC_DIR)
LDFLAGS		=	

RESET		=	\033[0;39m
GREEN		=	\033[0;32m

all:			$(NAME)

-include $(DEPS)

$(NAME):	$(OBJS)
			$(CC) $(CFLAGS) $(LDFLAGS) $< -o $@
			@printf "Created executable: $(GREEN)$(NAME)$(RESET)"

$(OBJ_DIR)%.o:	$(SRC_DIR)%.cpp | $(DEP_DIR) $(OBJ_DIR)
				$(CC) $(CFLAGS) $(DFLAGS) $(DEP_FILE) $(INCLUDES) -c $< -o $@

$(DEP_DIR) $(OBJ_DIR):
				mkdir -p $@

clean:
				$(RM) -f $(OBJ_DIR) $(DEP_DIR)

fclean:			clean
				$(RM) $(NAME)

re:				fclean
				$(MAKE) all

.PHONY: all clean fclean re
