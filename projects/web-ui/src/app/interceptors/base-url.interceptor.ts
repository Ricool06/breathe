import { HttpInterceptor, HttpRequest, HttpHandler, HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { parse } from 'url';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const { pathname } = parse(req.url);
    const { host, port, rootPath } = (pathname === '/predict') ? environment.predictionApi : environment.openaqApi;
    const url = `${host}:${port}${rootPath}${req.url}`;
    const newReq = req.clone({ url });
    return next.handle(newReq);
  }
}
