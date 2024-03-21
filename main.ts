import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createWriteStream, WriteStream, readFileSync } from 'fs';
import { compile, Processed, preprocess, PreprocessorGroup } from "svelte/compiler";
import { typescript } from 'svelte-preprocess';

type Options = {
	infile: string,
	outfile: string,
};

function getOptions(): Promise<Options> {
	const args: string[] = hideBin(process.argv);

	return <Promise<Options>> yargs(args)
		.usage("$0", "Compile svelte components to javascript files.")
		.options({
			infile: {
				description: "Svelte file to be compiled",
				type: "string",
				demandOption: true,
				requiresArg: true
			},
			outfile: {
				description: "Destination file",
				type: "string",
				demandOption: true,
				requiresArg: true
			},
		})
		.parse();
}

export async function transpile () {
	const options: Options = await getOptions();
	const outputStream: WriteStream = createWriteStream(options.outfile);
	const source: string = readFileSync(options.infile, 'utf-8');
	const preprocessorGoup: PreprocessorGroup = await typescript();
	const filename = options.infile;
	const preprocessed: Processed = await preprocess(source, preprocessorGoup, { filename });
	const result = compile(preprocessed.code, { filename });
	outputStream.write(result.js.code);
	outputStream.close();
}
