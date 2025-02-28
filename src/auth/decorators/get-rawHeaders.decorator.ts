import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador personalizado para obtener los encabezados sin procesar de la solicitud
export const RawHeaders = createParamDecorator(
    (data: string, ctx:ExecutionContext)=>{
        const req = ctx.switchToHttp().getRequest();
        const rawHeadersAnswer = req.rawHeaders
        
        return rawHeadersAnswer
    }
);