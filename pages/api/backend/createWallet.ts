import { NextApiHandler } from "next"
import { unstable_getServerSession } from "next-auth"
import { AUTH_OPTIONS } from "../auth/[...nextauth]"
import { getClientForServer } from "../../../src/graphql/getClientForServer"
import { CreateNiftoryWalletDocument } from "../../../generated/graphql"
 

const handler: NextApiHandler = async (req, res) => {
  try {
    const session = await unstable_getServerSession(req, res, AUTH_OPTIONS)

    if (!session.authToken || !session.userId) {
      res.status(401).send("There must be a user signed in to use this API route")
      return
    }
    const requestMethod = req.method
    const userId = session.userId as string
    const serverSideBackendClient = await getClientForServer()

    if (requestMethod === "POST") {
      const postData = await serverSideBackendClient.request(CreateNiftoryWalletDocument, {
        userId,
      })

      serverSideBackendClient.request(CreateNiftoryWalletDocument, {
        userId,
      })
      res.status(200).json(postData)
    } else {
      res.status(405).end("Method not allowed, this endpoint only supports POST")
    }
  } catch (e) {
    res.status(500).json(e)
  }
}

export default handler
