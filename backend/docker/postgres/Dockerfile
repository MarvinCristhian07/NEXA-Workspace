FROM postgres:16-alpine

ENV LANG pt_BR.utf8

COPY postgresql.conf /etc/postgresql/postgresql.conf

COPY ./init/ /docker-entrypoint-initdb.d/

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]