NAME	=	#archive name

SRC		=	#source files

INC_DIR		:=	inc/
SRC_DIR		:=	src/
OBJ_DIR		:=	obj/
DEP_DIR 	:=	dep/

CC			:=	gcc
CFLAGS		:=	-Wall -Wextra -Werror
DFLAGS		:=	-MMD -MF
DEP_FILE	=	$(DEP_DIR)$*.d
RM			:=	rm -r
AR			:=		ar -rc

SRCS	:=	$(addprefix $(SRC_DIR), $(addsuffix .c, $(SRC)))
OBJS	:=	$(addprefix $(OBJ_DIR), $(addsuffix .o, $(SRC)))
DEPS	:=	$(addprefix $(DEP_DIR), $(addsuffix .d, $(SRC)))

INCLUDES	=	-I $(INC_DIR)

RESET		=	\033[0;39m
GREEN		=	\033[0;32m

all:			$(NAME)

-include $(DEPS)

$(NAME):		$(OBJS)
				$(AR) $@ $(OBJS)
				@printf "Created archive: $(GREEN)$(NAME)$(RESET)"

$(OBJ_DIR)%.o:	$(SRC_DIR)%.c | $(DEP_DIR) $(OBJ_DIR)
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
