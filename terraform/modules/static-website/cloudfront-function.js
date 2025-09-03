function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Handle redirects for old Notion URLs
    if (uri.includes('Anbindung-Interactive-Brokers')) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: '/content/knowledge-base/anleitung-anbindung/' }
            }
        };
    }
    
    if (uri.includes('Manueller-Datenexport')) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                'location': { value: '/content/knowledge-base/anleitung-manueller-export/' }
            }
        };
    }
    
    // Check whether the URI is missing a file name
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }
    
    return request;
}