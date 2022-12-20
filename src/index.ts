type Header = {
    key: string,
    value: string,
}

const enum IDS {
    default = 'default',
    somepolicy = 'some-policy',
    AGPolicy = 'agpolicy',
    script = 'script',
    duplicates = 'duplicates',
}

type HeaderData = {
    id: IDS,
    name: string,
    cspHeader: Header
}

type Headers = {
    [key: string]: HeaderData
}

const headers: Headers = {
    default: {
        id: IDS.default,
        name: 'one two default',
        cspHeader: {
            key: 'Content-Security-Policy',
            value: `trusted-types one two default; require-trusted-types-for 'script';`
        },
    },
    somepolicy: {
        id: IDS.somepolicy,
        name: 'some-policy',
        cspHeader: {
            key: 'Content-Security-Policy',
            value: `trusted-types some-policy; require-trusted-types-for 'script';`
        },
    },
    adguard: {
        id: IDS.AGPolicy,
        name: 'one two AGPolicy',
        cspHeader: {
            key: 'Content-Security-Policy',
            value: `trusted-types one two AGPolicy; require-trusted-types-for 'script';`
        },
    },
    script: {
        id: IDS.script,
        name: 'only require-trusted-types-for',
        cspHeader: {
            key: 'Content-Security-Policy',
            value: `require-trusted-types-for 'script'`
        }
    },
    duplicates: {
        id: IDS.duplicates,
        name: 'one two AGPolicy with "allow-duplicates"',
        cspHeader: {
            key: 'Content-Security-Policy',
            value: `trusted-types one two AGPolicy 'allow-duplicates'; require-trusted-types-for 'script';`
        }
    }
}

const renderPage = (header: HeaderData) => {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Trusted Types Test</title>
</head>
<body>
   <h1>${header.name}</h1>
   <a href="/">Back</a>
   <iframe
        src="https://iframe.mediadelivery.net/embed/2196/55f000fa-aed6-4cd0-99b8-5ff963f2e459?autoplay=true"
        loading="lazy"
        style="border: none"
        allowfullscreen="true"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    ></iframe>
</body>
</html>`;
}

const getResponse = (header: HeaderData) => {
    return new Response(renderPage(header), {
        headers: {
            [header.cspHeader.key]: header.cspHeader.value,
            'content-type': 'text/html;charset=UTF-8',
        }
    });
}

const renderRoot = (headers: Headers) => {
    const headersItems = Object.values(headers)
        .map((item) => {
            return `<li><a href="/${item.id}">${item.name}</a></li>`;
        });

    const headersList = `<ul>${headersItems.join('')}</ul>`

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Trusted Types Test</title>
</head>
<body>
    Test links:
   ${headersList}
</body>
</html>`;
}

/**
 * Requests handler.
 * @param request
 */
const handleRequest = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;
    switch (path) {
        case '/':
            return new Response(renderRoot(headers), {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
            });
        case `/${headers.default.id}`: {
            return getResponse(headers.default);
        }
        case `/${headers.somepolicy.id}`: {
            return getResponse(headers.somepolicy);
        }
        case `/${headers.adguard.id}`: {
            return getResponse(headers.adguard);
        }
        case `/${headers.script.id}`: {
            return getResponse(headers.script);
        }
        case `/${headers.duplicates.id}`: {
            return getResponse(headers.duplicates);
        }
        default:
            return new Response('404', { status: 404 });
    }
}

export default {
    async fetch(request: Request): Promise<Response> {
        return handleRequest(request);
    },
};
