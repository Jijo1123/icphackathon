export const idlFactory = ({ IDL }: { IDL: any }) => {
    return IDL.Service({
        'upload_file': IDL.Func([IDL.Text, IDL.Vec(IDL.Nat8)], [], []),
        'list_files': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
        'download_file': IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    });
};
