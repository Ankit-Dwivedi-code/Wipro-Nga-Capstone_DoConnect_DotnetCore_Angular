# DoConnect — API Endpoints Summary (quick view)



## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

## Questions
- `GET /api/questions` — optional `?q=`
- `GET /api/questions/{id}` — if implemented
- `POST /api/questions` — (auth)
- `POST /api/questions/{id}/images` — (auth) multipart form `file=<image>`
- `DELETE /api/questions/{id}` — (admin)

## Answers
- `GET /api/answers?questionId={guid}`
- `POST /api/answers?questionId={guid}` — (auth)
- `POST /api/answers/{id}/images` — (auth)
- `DELETE /api/answers/{id}` — (admin)

## Static files
- Images served from `http://<api-host>/uploads/...` (and possibly `/images/default.png` if present)
