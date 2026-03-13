/**
 * Regular expression patterns designed to catch heavily obfuscated profanity
 * that standard dictionary filters might miss even after normalization.
 * 
 * Note: These patterns heavily utilize the fact that the text is normalized first.
 */
export const profanityPatterns: RegExp[] = [
    // Matches g[a@4]nd[u], gaand, gand, g.a.n.d, etc. (after basic normalization it will look like 'gand' or 'gaand')
    /g[a]+[n]+[d]+[u]?/i,
    
    // Matches b[e3]w[a@]k[o0]of
    /b[e]+[w]+[a]+[k]+[o]+[f]+/i,
    /b[e]+[v]+[k]+[u]+[f]+/i,
    
    // Matches m[a@]d[a@]rch[o0]d, mdrcd, etc.
    /m[a]*[d]+[a]*[r]+[c]+[h]+[o]*[d]+/i,
    /^mc$/i,
    /^m\.?c\.?$/i,
    
    // Matches ch[u*]t[i1]ya
    /c[h]+[u]+[t]+[i]+[y]+[a]+/i,
    /c[h]+[u]+[t]+[y]+[a]+/i,
    
    // Matches bhenchod, bc, etc.
    /b[h]*[e]+[n]+[c]+[h]+[o]*[d]+/i,
    /^bc$/i,
    /^b\.?c\.?$/i,
    
    // Matches bsdk, bhosdike, etc.
    /b[h]*[o]+[s]+[d]+[i]*[k]+[e]*/i,
    /^bsdk$/i,
    
    // Matches lavda, lauda, loda, etc.
    /l[a]+[u|v]+[d]+[a]/i,
    /l[o]+[d]+[a]/i,

    // Matches lund
    /l[a|u]+[n]+[d]+/i,
    
    // English swear bypasses
    /f[u\*\_]+c[k\*\_]+/i,
    /^fuk$/i,
    /s[h\*\_]+i[t\*\_]+/i,
    /b[i\*\_]+t[c\*\_]+h/i,
    /a\$+h[o0]le/i,
    
    // Direct matches for highly toxic Hinglish/Hindi stems not caught by English standard filter
    /raand/i,
    /randi/i,
    /chinaal/i,
    /muthal/i
];
