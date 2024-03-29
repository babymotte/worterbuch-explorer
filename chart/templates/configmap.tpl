---
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Chart.Name }}-config
data:
  default.conf: |-
    server {
      listen       80;
      listen  [::]:80;
      server_name  localhost;

      location / {
          root   /usr/share/nginx/html;
          index  index.html index.htm;
      }

      # redirect page not found to index (required by ReactJs router)
      #
      error_page  404              /;

      # redirect server error pages to the static page /50x.html
      #
      error_page   500 502 503 504  /50x.html;
      location = /50x.html {
          root   /usr/share/nginx/html;
      }
    }
