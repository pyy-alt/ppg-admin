FROM node:22

WORKDIR "/root"
RUN mkdir "/root/scripts"
COPY dockerfiles/scripts/*.sh /root/scripts/
RUN chmod 777 /root/scripts/*.sh

COPY dockerfiles/*.sh /root/
RUN chmod 777 /root/*.sh

# We expose in case we are running "serve"
# This won't have any impact if we are running "build"
EXPOSE 8080

# There is no ending CMD -- that is the responsibility of the caller
