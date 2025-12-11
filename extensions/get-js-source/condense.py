#
# condenses and organizes output from get-v8-js extension
#
# paul sery, Aug '25
#

import sys
 
i = 1
prevHash = ''
result = {}

for line in sys.stdin:
    if 'HASH:' in line:
        noHash = False
        e = line.split('|',3)
        hash = e[1].replace("HASH:", "").rstrip()
        url  = e[2].replace("URL:", "").rstrip()
        js   = e[3].replace("JS:", "").rstrip()
    else:
        # assumes dict contains the related hash
        noHash = True
        js = result[hash]['js'] + line.rstrip('\n')
        i = 0


    if hash in result.keys():
        result[hash] = {'url': url, 'js': js, 'count': i}
        i = i + 1
        result[hash]['count'] = i
    else:
        result[hash] = {'url': url, 'js': js, 'count': 1}
        i = 0


for k,v in result.items():
    print('Hash: ', k, ' Count: ', v['count'], '\n', 'URL: ', v['url'], '\n', 'JS: ', v['js'], '\n')
