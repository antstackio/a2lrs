FROM public.ecr.aws/lambda/provided:al2-x86_64

# Install SSL Li
WORKDIR /tmp
RUN yum install -y perl-core zlib-devel gzip wget tar make gcc
RUN wget https://www.openssl.org/source/openssl-1.1.1l.tar.gz 
RUN ls 
RUN tar -xvf openssl-1.1.1l.tar.gz 
RUN cd openssl-1.1.1l \
    && ./config --prefix=/usr/local/ssl --openssldir=/usr/local/ssl shared zlib \
    && make \
    && make install
ENV PATH="/usr/local/ssl/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/local/ssl/lib:${LD_LIBRARY_PATH}"

# Update YUM
RUN yum update -y

# Download and extract Python
RUN wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tgz
RUN tar xvf Python-3.11.1.tgz

# Configure and compile Python
RUN cd Python-3.11.1 && \
    ./configure --enable-optimizations --with-openssl=/usr/local/ssl && \
    make altinstall

# Verify Python and SSL module
RUN python3.11 --version
RUN python3.11 -m ssl

# Copy custom runtime bootstrap
COPY bootstrap ${LAMBDA_RUNTIME_DIR}
RUN chmod +x ${LAMBDA_RUNTIME_DIR}/bootstrap

# requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}/requirements.txt
RUN python3.11 -m pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt -t ${LAMBDA_TASK_ROOT}/ 

# Copy function code
COPY lambda_function.py ${LAMBDA_TASK_ROOT}/lambda_function.py

RUN python3.11 -m pip install requests

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "lambda_function.handler" ]
