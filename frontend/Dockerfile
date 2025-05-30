FROM nginx:alpine

COPY *.html *.css *.js /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT sh -c "sed -i -e 's/BACKEND_DNS/${BACKEND_DNS}/g' -e 's/BACKEND_PORT/${BACKEND_PORT}/g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'"