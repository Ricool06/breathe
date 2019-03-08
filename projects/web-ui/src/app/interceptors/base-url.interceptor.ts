import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const { host, port, rootPath } = environment.openaqApi;
    const url = `${host}:${port}${rootPath}${req.url}`;
    const newReq = req.clone({ url });
    return next.handle(newReq);
  }
}
