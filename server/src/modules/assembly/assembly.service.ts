import getAssemblyToken from "../../utils/assembly";

export class AssemblyService {
  async generateToken() {
    return await getAssemblyToken(process.env.ASSEMBLY_API_KEY || '');
  }

}