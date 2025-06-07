import {NextResponse} from "next/server";
import {auth} from "../../../lib/AdminSDK";

export async function GET(){
    try {
        const listAll = async (pageToken?:string,users:any[]=[])=>{
            const result = await auth.listUsers(1000,pageToken);
            users.push(...result.users);

            if(result.pageToken){
                return listAll(result.pageToken,users)
            }else{
                return users;
            }
        }

        const users = await listAll();
        const formatted = users.map((user)=>({
            uid:user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            disabled: user.disabled,
            customClaims: user.customClaims,
        }))


        return NextResponse.json({ users: formatted });
    } catch (error) {
        return  NextResponse.json({ error: 'Failed to list users', details: error });
    }

}